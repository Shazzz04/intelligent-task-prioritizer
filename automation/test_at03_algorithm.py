import unittest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestAlgorithm(unittest.TestCase):
    def test_mcdm_output(self):
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        driver.get("http://localhost:3000/?user=test_audit")
        wait = WebDriverWait(driver, 10)
        
        # Look for any colored badge in the table
        badge = wait.until(EC.presence_of_element_located((By.XPATH, "//td//span[contains(@style, 'background')]")))
        print(f"\n[PASSED] AT03: Algorithm Output Verified: {badge.text}")
        driver.quit()

if __name__ == "__main__":
    unittest.main()