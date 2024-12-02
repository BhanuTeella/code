from backend import create_app
from worker import celery_init_app
from tasks import  daily_reminder, monthly_report,create_resource_csv
from celery.schedules import crontab

app = create_app()
celery_app= celery_init_app(app)

@celery_app.on_after_configure.connect
def periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=10, minute=20),
        daily_reminder.s(),
    )
    sender.add_periodic_task(
        crontab(hour=10, minute=20, day_of_month=20),
        monthly_report.s(),
    )

if __name__ == "__main__":
    app.run(debug=True)

