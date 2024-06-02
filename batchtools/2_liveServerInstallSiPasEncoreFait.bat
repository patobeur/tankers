@echo off
cd..
setlocal

:: Exécuter npm install pour installer les dépendances du projet
:: Installer live-server en local
echo Installation de live-server en local...

:: Vérifier si live-server est déjà installé localement
echo Vérification de l'installation de live-server...
npm list live-server >nul 2>&1
if %errorlevel% neq 0 (
    echo "live-server n'est pas installé. Installation en cours..."
    npm install live-server
    if %errorlevel% neq 0 (
        echo "Erreur lors de l'installation de live-server"
        pause
        exit /b %errorlevel%
    )
) else (
    echo "live-server est déjà installé."
)

endlocal
