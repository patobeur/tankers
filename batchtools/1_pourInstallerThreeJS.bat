@echo off
cd..
:: Vérifier si le dossier node_modules/three existe
if exist node_modules\three (
    echo "Le module three est déjà installé."
    echo "Vous pouvez supprimer le dossier node_modules pour refaire l'install des dépendences."
) else (
    echo "Le module three n'est pas installé. Installation en cours..."
    npm install three
    if %errorlevel% neq 0 (
        echo "Erreur lors de l'installation du module three"
        pause
        exit /b %errorlevel%
    )
)
pause
