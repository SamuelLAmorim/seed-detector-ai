import unittest

from app.classification import normalize_class_name


class ClassificationTests(unittest.TestCase):
    def test_normalize_class_name_known_aliases(self):
        cases = [
            ("inteira", "inteira"),
            ("Milho Inteiro", "inteira"),
            ("semente-quebrada", "quebrada"),
            ("bug", "predada"),
            ("milho_predado", "predada"),
        ]

        for raw_name, expected in cases:
            with self.subTest(raw_name=raw_name):
                self.assertEqual(normalize_class_name(raw_name), expected)

    def test_normalize_class_name_unknown_alias_returns_none(self):
        self.assertIsNone(normalize_class_name("folha"))


if __name__ == "__main__":
    unittest.main()