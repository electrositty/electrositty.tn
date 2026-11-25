@echo off
REM ==================================================================
REM  Compression des videos ElectroSitty pour le web
REM  1) Installer ffmpeg : winget install ffmpeg   (puis rouvrir le terminal)
REM  2) Placer ce fichier dans le dossier "electrositty" (a cote de index.html)
REM  3) Double-cliquer dessus
REM  Resultat : dossier "optimized" avec les videos compressees + une image
REM  d'apercu (.jpg) par video. Verifier, puis remplacer les originaux.
REM ==================================================================

if not exist optimized mkdir optimized

for %%f in ("src\videos\*.mp4" "src\videos\*.mov" "src\images\gallery\*.mp4") do (
    echo.
    echo === %%~nxf ===

    REM Video : max 1280px de large, H.264, son AAC 96k, lecture immediate (faststart)
    ffmpeg -y -loglevel error -stats -i "%%f" ^
        -vf "scale='min(1280,iw)':-2" ^
        -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p ^
        -c:a aac -b:a 96k ^
        -movflags +faststart ^
        "optimized\%%~nf.mp4"

    REM Image d'apercu (poster) prise a la 1re seconde
    ffmpeg -y -loglevel error -ss 1 -i "%%f" -frames:v 1 ^
        -vf "scale='min(1280,iw)':-2" -q:v 4 ^
        "optimized\%%~nf.jpg"
)

echo.
echo Termine ! Comparez les tailles dans le dossier "optimized".
pause
