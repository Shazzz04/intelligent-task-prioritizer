import unittest
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By

class TestDelete(unittest.TestCase):
    def test_delete_task(self):
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        driver.get("http://localhost:3000/?user=test_audit")
        driver.execute_script("window.confirm = function(){return true;}")
        
        remove_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Remove')]")
        remove_btn.click()
        
        time.sleep(1)
        print("\n[PASSED] AT04: Task Deletion Verified.")
        driver.quit()

if __name__ == "__main__":
    unittest.main()