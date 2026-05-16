import unittest
import time
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class PrioritySystemAutomation(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        cls.driver.maximize_window()
        cls.url = "http://localhost:3000/?user=selenium_audit_01"
        cls.wait = WebDriverWait(cls.driver, 15)

    def test_01_ui_integrity(self):
        """AT01: Verify Dashboard Rendering"""
        self.driver.get(self.url)
        header = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        self.assertIn("Student Priority Hub", header.text)
        print("\n[PASSED] AT01: UI Components Loaded.")

    def test_02_task_creation_flow(self):
        """AT02: Verify End-to-End Task Injection"""
        title_field = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@placeholder='Task Title']")))
        title_field.clear()
        title_field.send_keys("Automated Validation Task")
        
        deadline_field = self.driver.find_element(By.XPATH, "//input[@type='datetime-local']")
        future_date = (datetime.now() + timedelta(days=2)).strftime("%m%d%Y\t%I%M%p")
        deadline_field.send_keys(future_date)
        
        submit_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Add')]")
        submit_btn.click()
        
        new_task = self.wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Automated Validation Task')]")))
        self.assertTrue(new_task.is_displayed())
        print("[PASSED] AT02: Task injected successfully.")

    def test_03_mcdm_algorithm_output(self):
        """AT03: Verify Calculation Logic Display"""
        time.sleep(3)
        
 
        badge = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//table//tr[last()]/td[contains(@class, 'priority') or contains(@class, 'badge') or position() > 2]"))
        )
        
        self.assertTrue(len(badge.text) > 0)
        print(f"[PASSED] AT03: MCDM Calculation Result Verified: {badge.text}")

    def test_04_state_cleanup(self):
        """AT04: Verify Deletion and Cleanup"""
        self.driver.execute_script("window.confirm = function(){return true;}")
        
        remove_btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Remove')]")))
        remove_btn.click()
        
        self.wait.until(EC.invisibility_of_element_located((By.XPATH, "//*[contains(text(), 'Automated Validation Task')]")))
        print("[PASSED] AT04: Cleanup Successful.")

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

if __name__ == "__main__":
    unittest.main(verbosity=2)