import requests

URL_PATH = "http://localhost:8000/api/v0.01/fieldtest/"
HEADERS = {"Content-Type": "application/json"}


for _ in range(10000):
    R = requests.post(URL_PATH, json={}, headers=HEADERS)
    fieldtest_id = R.json()["id"]
    for i in range(100):
        DATA = {
            "build_train": "build_train" + str(i),
            "build_version": "build_version" + str(i),
            "model_hardware": "model_hardware" + str(i),
            "device_ecid": "device_ecid" + str(i),
            "device_serial_number": "device_serial_number" + str(i),
        }
        requests.post(URL_PATH + fieldtest_id + "/archive/", json=DATA, headers=HEADERS)
print("Done")

