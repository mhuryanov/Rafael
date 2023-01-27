# RAFAEL
Shared by Eric Tang

Keylime API
# How to update backend

## Initialise submodules
```bash
git submodule update --init --recursive
```
## Fetch latest backend from rafael_backend folder
```bash
cd rafael_backend
git fetch
cd ..
```

## List all available backend tags
```bash
git tag -l -n or git submodule foreach git tag -l -n
```

## Checkout the backend tag of interest
```bash
git checkout tags/X.Y.Z
```

## Commit the latest backend
(it should be a tiny file one line changed )
```bash
git add rafael_backend
git commit -m "Using backend tag X.Y.Z"
'''
