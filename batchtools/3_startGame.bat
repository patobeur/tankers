@echo off
cd..
:: Afficher un message personnalisé dans la console principale
echo Serveur local prêt à démarrer à l'adresse http://127.0.0.1:8080
echo La fenêtre du navigateur s'ouvrira automatiquement si tout marche.

start "" cmd /k "npx live-server --port=8080"

:: Ouvrir le navigateur par défaut à l'URL spécifique
start "" http://localhost:8080


echo Serveur local démarré à l'adresse http://localhost:8080
echo Appuyez sur une touche pour fermer...
pause
