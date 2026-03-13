# golang-migrate

## インストール

\```sh
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
\```

## PATHを通す

**Mac（zsh）**
\```sh
echo 'export PATH=$PATH:$HOME/go/bin' >> ~/.zshrc
source ~/.zshrc
\```

**Linux / WSL2（bash）**
\```sh
echo 'export PATH=$PATH:$HOME/go/bin' >> ~/.bashrc
source ~/.bashrc
\```

## 確認
\```sh
migrate --version
\```