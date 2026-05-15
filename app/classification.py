CLASS_ALIASES = {
    "inteira": "inteira",
    "inteiro": "inteira",
    "seed_inteira": "inteira",
    "semente_inteira": "inteira",
    "milho_inteira": "inteira",
    "milho_inteiro": "inteira",
    "quebrada": "quebrada",
    "quebrado": "quebrada",
    "seed_quebrada": "quebrada",
    "semente_quebrada": "quebrada",
    "milho_quebrada": "quebrada",
    "milho_quebrado": "quebrada",
    "predada": "predada",
    "predado": "predada",
    "pedrada": "predada",
    "bug": "predada",
    "seed_predada": "predada",
    "semente_predada": "predada",
    "milho_predada": "predada",
    "milho_predado": "predada",
}


def normalize_class_name(class_name: str) -> str | None:
    normalized = class_name.strip().lower().replace(" ", "_").replace("-", "_")
    return CLASS_ALIASES.get(normalized)