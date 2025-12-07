import pandas as pd

url = "https://www.nemweb.com.au/REPORTS/CURRENT/CDEII/CO2EII_AVAILABLE_GENERATORS.CSV"
path = "/tmp/example.zip"

df = pd.read_csv(
    path,
    header=1,
).iloc[:-1, 4:]

print(df)


df = pd.read_csv(
    path,
    header=1,
    skipfooter=1,
    engine='python', # far slower, but required for skipfooter
).iloc[:, 4:]

print(df)