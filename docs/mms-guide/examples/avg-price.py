import os

from nemosis import dynamic_data_compiler

start_time = '2025/07/01 00:05:00'
end_time = '2025/08/01 00:00:00'
table = 'DISPATCHPRICE'

# I re-use this folder across all projects, to avoid re-downloading
data_directory = '/home/matthew/Data/nemosis/' 

# nemosis will not create the directory for is
if not os.path.exists(data_directory):
    os.makedirs(data_directory)

# download and preprocess the data with nemosis
# returning a Pandas dataframe
df = dynamic_data_compiler(start_time, end_time, table, data_directory)

# drop INTERVENTION==1
df = df.loc[df["INTERVENTION"] == 0]

# aggregate with mean by region
# RRP is price column, rename it to be clearer
result = df.groupby("REGIONID")["RRP"].mean()
print(result)