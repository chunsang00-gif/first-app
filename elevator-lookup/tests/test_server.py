import importlib.util
import io
import unittest
from pathlib import Path
from unittest.mock import patch
ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('lift_server', ROOT/'server.py')
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)
class Tests(unittest.TestCase):
    def test_valid_xml(self):
        sample = b'<response><header><resultCode>00</resultCode></header><body><items><item><elevator_no>8088381</elevator_no><buildingName>\xeb\x8d\xb0\xeb\xaa\xa8 \xea\xb1\xb4\xeb\xac\xbc</buildingName><elevatorStatus>\xec\x9a\xb4\xed\x96\x89</elevatorStatus></item></items></body></response>'
        result, _ = app.parse_xml(sample, '8088381')
        self.assertEqual(result[0]['building'], '데모 건물')
        self.assertEqual(result[0]['status'], '운행')
    def test_no_results(self):
        result, _ = app.parse_xml(b'<response><header><resultCode>00</resultCode></header><body><items/></body></response>', '8088381')
        self.assertEqual(result, [])
    def test_error(self):
        with self.assertRaises(ValueError):
            app.parse_xml(b'<response><resultCode>20</resultCode></response>', '8088381')
    def test_config(self):
        with patch.dict('os.environ', {}, clear=True):
            status, out = app.fetch_elevator('8088381')
        self.assertEqual(status, 503)
        self.assertEqual(out['error'], 'NOT_CONFIGURED')
    def test_fields_are_allowlisted(self):
        record = app.normalize({'elevator_no': '8088381', 'secret': 'no', 'buildingName': '테스트'}, '8088381')
        self.assertNotIn('secret', record)
        self.assertEqual(record['building'], '테스트')
if __name__ == '__main__': unittest.main()
