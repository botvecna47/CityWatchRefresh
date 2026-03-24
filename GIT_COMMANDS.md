# Git Commands Guide

Here are the basic commands to save your work and push it to your repository.

### 1. Check your changed files
```bash
git status
```

### 2. Stage your changes
To stage all modified and new files:
```bash
git add .
```
*(Or you can add a specific file with `git add filename.txt`)*

### 3. Commit your changes
Saves your staged changes locally with a descriptive message:
```bash
git commit -m "Your commit message here"
```

### 4. Push to remote repository
Uploads your local commits to your remote repository (e.g., GitHub):
```bash
git push
```
*(If you are pushing a brand new branch for the first time, use `git push -u origin branch-name` instead)*

---

### Quick Sequence (All-in-one)
If you just want to quickly save and push everything, you can run these three commands consecutively:
```bash
git add .
git commit -m "Make typical updates"
git push
```
