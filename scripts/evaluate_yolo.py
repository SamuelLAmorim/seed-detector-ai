"""Evaluate the SeeDetector AI YOLO model on a labeled dataset.

Example:
    python scripts/evaluate_yolo.py --data datasets/seedetector/data.yaml --model models/best.pt
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def as_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def build_summary(model: Any, metrics: Any) -> dict[str, Any]:
    box = getattr(metrics, "box", None)
    speed = getattr(metrics, "speed", None)

    return {
        "model_classes": {str(key): str(value) for key, value in getattr(model, "names", {}).items()},
        "metrics": {
            "precision": as_float(getattr(box, "mp", None)),
            "recall": as_float(getattr(box, "mr", None)),
            "map50": as_float(getattr(box, "map50", None)),
            "map50_95": as_float(getattr(box, "map", None)),
        },
        "speed_ms": speed or {},
        "results_dir": str(getattr(metrics, "save_dir", "")),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate a YOLO model for SeeDetector AI.")
    parser.add_argument("--data", required=True, help="Path to YOLO data.yaml")
    parser.add_argument("--model", default="models/best.pt", help="Path to YOLO model weights")
    parser.add_argument("--imgsz", type=int, default=640, help="Validation image size")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold")
    parser.add_argument("--split", default="val", choices=["train", "val", "test"], help="Dataset split")
    parser.add_argument("--project", default="runs/evaluate", help="Output project directory")
    parser.add_argument("--name", default="seedetector", help="Output run name")
    parser.add_argument("--summary", default="runs/evaluate/summary.json", help="JSON summary output path")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    model_path = Path(args.model)
    data_path = Path(args.data)

    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}")
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset config not found: {data_path}")

    from ultralytics import YOLO

    model = YOLO(str(model_path))
    metrics = model.val(
        data=str(data_path),
        imgsz=args.imgsz,
        conf=args.conf,
        split=args.split,
        project=args.project,
        name=args.name,
    )

    summary = build_summary(model, metrics)
    summary_path = Path(args.summary)
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()