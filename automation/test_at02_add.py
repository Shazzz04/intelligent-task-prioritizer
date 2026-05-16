import unittest
import time
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestAdd(unittest.TestCase):
    def test_add_task(self):
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        driver.get("http://localhost:3000/?user=test_audit")
        wait = WebDriverWait(driver, 15) # Give it 15 seconds to find elements
        
        # 1. Fill Title
        title_field = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@placeholder='Task Title']")))
        title_field.send_keys("Selenium Unit Test")
        
        # 2. Fill Deadline (Important for React state)
        deadline_field = driver.find_element(By.XPATH, "//input[@type='datetime-local']")
        future_date = (datetime.now() + timedelta(days=2)).strftime("%m%d%Y\t%I%M%p")
        deadline_field.send_keys(future_date)
        
        # 3. Click Submit
        submit_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Add')]")
        submit_btn.click()
        
        # 4. WAIT for the specific text to appear in the DOM (Crucial Fix)
        # Instead of find_element, we use wait.until
        new_task = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Selenium Unit Test')]")))
        
        self.assertTrue(new_task.is_displayed())
        print("\n[PASSED] AT02: Task Entry Recorded and Verified in Table.")
        
        time.sleep(2) # Give you time to see it before it closes
        driver.quit()

if __name__ == "__main__":
    unittest.main()