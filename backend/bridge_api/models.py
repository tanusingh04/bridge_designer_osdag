from django.db import models

class Location(models.Model):
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    wind_speed = models.FloatField()  # m/s
    seismic_zone = models.CharField(max_length=10)
    seismic_factor = models.FloatField()
    max_temp = models.FloatField()
    min_temp = models.FloatField()

    def __str__(self):
        return f"{self.district}, {self.state}"
