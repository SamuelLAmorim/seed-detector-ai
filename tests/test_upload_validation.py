import unittest

from app.upload_validation import UploadValidationError, format_bytes_as_mb, validate_image_upload


class UploadValidationTests(unittest.TestCase):
    def test_validate_image_upload_accepts_valid_image(self):
        validate_image_upload("image/jpeg", b"fake-bytes", 10)

    def test_validate_image_upload_rejects_invalid_inputs(self):
        cases = [
            ("text/plain", b"fake-bytes", 10, 400),
            ("image/jpeg", b"", 10, 400),
            ("image/png", b"123456", 5, 413),
        ]

        for content_type, image_bytes, max_bytes, status_code in cases:
            with self.subTest(content_type=content_type, max_bytes=max_bytes):
                with self.assertRaises(UploadValidationError) as context:
                    validate_image_upload(content_type, image_bytes, max_bytes)

                self.assertEqual(context.exception.status_code, status_code)

    def test_format_bytes_as_mb(self):
        self.assertEqual(format_bytes_as_mb(10 * 1024 * 1024), "10.0 MB")


if __name__ == "__main__":
    unittest.main()