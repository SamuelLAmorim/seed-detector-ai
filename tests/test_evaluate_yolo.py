import unittest
from types import SimpleNamespace

from scripts.evaluate_yolo import build_summary


class DummyModel:
    names = {0: "inteira", 1: "quebrada", 2: "predada"}


class EvaluateYoloTests(unittest.TestCase):
    def test_build_summary_extracts_core_yolo_metrics(self):
        metrics = SimpleNamespace(
            box=SimpleNamespace(mp=0.91, mr=0.82, map50=0.88, map=0.74),
            speed={"inference": 12.5},
            save_dir="runs/evaluate/seedetector",
        )

        summary = build_summary(DummyModel(), metrics)

        self.assertEqual(summary["model_classes"], {"0": "inteira", "1": "quebrada", "2": "predada"})
        self.assertEqual(summary["metrics"]["precision"], 0.91)
        self.assertEqual(summary["metrics"]["recall"], 0.82)
        self.assertEqual(summary["metrics"]["map50"], 0.88)
        self.assertEqual(summary["metrics"]["map50_95"], 0.74)
        self.assertEqual(summary["results_dir"], "runs/evaluate/seedetector")


if __name__ == "__main__":
    unittest.main()