#!/bin/sh
# Скрипт для объединения всех файлов схемы в один временный файл

SCHEMA_DIR="./prisma/schema"
OUTPUT_FILE="/tmp/prisma-combined.prisma"

# Очищаем выходной файл
> "$OUTPUT_FILE"

# Объединяем все .prisma файлы из папки schema/
for file in "$SCHEMA_DIR"/*.prisma; do
  if [ -f "$file" ]; then
    echo "// ============================================" >> "$OUTPUT_FILE"
    echo "// File: $(basename "$file")" >> "$OUTPUT_FILE"
    echo "// ============================================" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi
done

echo "$OUTPUT_FILE"



