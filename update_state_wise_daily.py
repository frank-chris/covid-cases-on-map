from git import Repo
import requests
import pandas as pd
import os

csv = 'state_wise_daily.csv'

def download_csv():
    url = 'https://api.covid19india.org/csv/latest/state_wise_daily.csv'
    r = requests.get(url, allow_redirects=True)
    open(csv, 'wb').write(r.content)

def modify_csv():
    df = pd.read_csv(csv)
    df.loc[6,'MP'] = 0
    df.to_csv(csv, index=False)

def run_pyscript():
    d = '.'
    folders = [os.path.join(d, o) for o in os.listdir(d) if os.path.isdir(os.path.join(d,o))]
    folders = [x.replace('.\\', '') for x in folders]
    
    for folder in folders:
        if 'data.js' in os.listdir(folder+'/'):
            os.system('python pyscript.py '+folder+' 03/23/2020')
    


def git_push():
    try:
        repo = Repo("../covid-cases-on-map")
        repo.git.add(update=True)
        repo.index.commit("(Auto-commit,push)Update state_wise_daily.csv")
        origin = repo.remote(name='origin')
        origin.push()
    except:
        print('Some error occured while pushing the code')    

download_csv()

modify_csv()

run_pyscript()

git_push()

