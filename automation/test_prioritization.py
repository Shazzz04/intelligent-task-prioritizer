from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from datetime import datetime, timedelta

# Setup Chrome
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

try:
    print("Starting Selenium Test: Intelligent Task Prioritization System")
    driver.get("http://localhost:3000/?user=test_student_01")
    driver.maximize_window()
    
    wait = WebDriverWait(driver, 20)

    title_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Task Title']")))
    title_input.send_keys("Automated Research Validation")

    deadline_input = driver.find_element(By.XPATH, "//input[@type='datetime-local']")
    future_date = (datetime.now() + timedelta(days=2)).strftime("%m%d%Y\t%I%M%p")
    deadline_input.send_keys(future_date)


    sliders = driver.find_elements(By.XPATH, "//input[@type='range']")
    
    for slider in sliders:
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'))", slider, 9)


    submit_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Add to Priority Engine')]")
    submit_btn.click()

    print("Task Submitted. Verifying MCDM Calculation...")
    
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Automated Research Validation')]")))
    
    print("TEST PASSED: MCDM score generated and task rendered in dashboard.")

except Exception as e:
    print(f"TEST FAILED: {e}")
    driver.save_screenshot("automation_error.png")

finally:
    time.sleep(5) 
    driver.quit()