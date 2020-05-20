from git import Repo


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