from git import Repo
import requests


url = 'https://api.covid19india.org/csv/latest/state_wise_daily.csv'
r = requests.get(url, allow_redirects=True)

open('state_wise_daily.csv', 'wb').write(r.content)

def git_push():
    try:
        repo = Repo("../covid-cases-on-map")
        repo.git.add(update=True)
        repo.index.commit("Test automated git add, commit and push")
        origin = repo.remote(name='origin')
        origin.push()
    except:
        print('Some error occured while pushing the code')    

git_push()