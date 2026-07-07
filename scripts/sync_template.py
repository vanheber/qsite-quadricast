#!/usr/bin/env python3
import os
import sys
import shutil
import argparse

# Configuração de cores para o terminal
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"

# Caminhos que devem ser preservados no cliente (nunca sobrescrever ou copiar)
PRESERVED_PATTERNS = {
    # Arquivos de configuração e dados
    ".env",
    "site.config.json",
    "catalog.json",
    "gallery.json",
    "README.md",
    
    # Conteúdo em markdown (páginas, posts, episódios)
    "src/site/content",
    "src/blog",
    "src/podcast",
    "src/bios",
    
    # Pastas de infraestrutura e build
    ".git",
    "node_modules",
    "public"
}

# Caminhos que devem ser copiados apenas se não existirem no destino
COPY_IF_MISSING_PATTERNS = {
    "src/site/assets/img",
    "src/site/assets/logo.svg",
    "src/site/assets/logo-inverted.svg",
    "src/site/assets/logo.webp",
    "src/site/assets/favicon.png"
}

def should_preserve(rel_path):
    # Normaliza caminhos para comparação
    rel_path = rel_path.replace(os.sep, "/")
    
    # Verifica correspondência exata ou de subdiretório
    for pattern in PRESERVED_PATTERNS:
        if rel_path == pattern or rel_path.startswith(pattern + "/"):
            return True
    return False

def sync_projects(src, dest):
    print(f"\n{BLUE}🚀 Iniciando sincronização do template base para o cliente...{RESET}")
    print(f"Origem (Template): {src}")
    print(f"Destino (Cliente) : {dest}\n")
    
    if not os.path.exists(src):
        print(f"{RED}❌ Erro: O diretório de origem '{src}' não existe.{RESET}")
        sys.exit(1)
        
    if not os.path.exists(dest):
        print(f"{RED}❌ Erro: O diretório de destino '{dest}' não existe.{RESET}")
        sys.exit(1)

    copied = 0
    skipped = 0
    updated = 0

    for root, dirs, files in os.walk(src):
        # Evita entrar em pastas que sabemos que são ignoradas para otimizar
        rel_root = os.path.relpath(root, src)
        if rel_root == ".":
            rel_root = ""
            
        # Filtra subdiretórios de infraestrutura na travessia
        dirs_to_keep = []
        for d in dirs:
            dir_rel = os.path.join(rel_root, d).replace(os.sep, "/")
            if not should_preserve(dir_rel):
                dirs_to_keep.append(d)
            else:
                skipped += 1
        dirs[:] = dirs_to_keep

        for file in files:
            file_src_path = os.path.join(root, file)
            file_rel_path = os.path.relpath(file_src_path, src)
            file_rel_norm = file_rel_path.replace(os.sep, "/")
            
            if should_preserve(file_rel_norm):
                # print(f"{YELLOW}• Ignorando arquivo preservado: {file_rel_path}{RESET}")
                skipped += 1
                continue
                
            file_dest_path = os.path.join(dest, file_rel_path)
            
            # Se o arquivo pertence aos padrões de cópia condicional (apenas se faltar)
            is_copy_if_missing = False
            for pattern in COPY_IF_MISSING_PATTERNS:
                if file_rel_norm == pattern or file_rel_norm.startswith(pattern + "/"):
                    is_copy_if_missing = True
                    break
                    
            if is_copy_if_missing and os.path.exists(file_dest_path):
                skipped += 1
                continue
                
            dest_dir = os.path.dirname(file_dest_path)
            
            # Garante que a pasta de destino existe
            if not os.path.exists(dest_dir):
                os.makedirs(dest_dir, exist_ok=True)
                
            # Verifica se o arquivo mudou ou não existe
            if os.path.exists(file_dest_path):
                # Se o arquivo já existe, compara tamanho e data de modificação
                # para ver se realmente precisa copiar
                src_stat = os.stat(file_src_path)
                dest_stat = os.stat(file_dest_path)
                if src_stat.st_size == dest_stat.st_size and src_stat.st_mtime <= dest_stat.st_mtime:
                    # Idêntico ou destino é mais recente, pula
                    skipped += 1
                    continue
                else:
                    print(f"🔄 Atualizando: {file_rel_path}")
                    updated += 1
            else:
                print(f"➕ Adicionando: {file_rel_path}")
                copied += 1
                
            shutil.copy2(file_src_path, file_dest_path)

    print(f"\n{GREEN}✅ Sincronização concluída com sucesso!{RESET}")
    print(f"  • Arquivos adicionados: {copied}")
    print(f"  • Arquivos atualizados: {updated}")
    print(f"  • Arquivos preservados/inalterados: {skipped}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sincroniza arquivos de código do core do template com o cliente.")
    parser.add_argument("--src", default="/Volumes/Arquivos/projetos-git/qsite", help="Caminho do repositório template (origem)")
    parser.add_argument("--dest", required=True, help="Caminho do repositório do cliente (destino)")
    args = parser.parse_args()
    
    sync_projects(args.src, args.dest)
