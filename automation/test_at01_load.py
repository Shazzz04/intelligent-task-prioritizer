import unittest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By

class TestLoad(unittest.TestCase):
    def test_dashboard_renders(self):
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        driver.get("http://localhost:3000/?user=test_audit")
        header = driver.find_element(By.TAG_NAME, "h1")
        self.assertIn("Student Priority Hub", header.text)
        print("\n[PASSED] AT01: Dashboard Loaded Successfully.")
        driver.quit()

if __name__ == "__main__":
    unittest.main()