#!/bin/bash

if command -v node &> /dev/null
then
    node ./index.js
else
    echo "Node.js não está instalado. Por favor, instale o Node.js para continuar."
fi