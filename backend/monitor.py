import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from healer import check_and_heal

class HealHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            print(f"⚠️ Change detected in {event.src_path}. Verifying integrity...")
            check_and_heal()

if __name__ == "__main__":
    observer = Observer()
    observer.schedule(HealHandler(), path="../data", recursive=False)
    observer.start()
    print("🛡️ Watchdog is active. Monitoring 'data' folder for corruption...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()