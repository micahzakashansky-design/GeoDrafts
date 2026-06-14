import sys

def apply_merge_diff(file_path, patch_path):
    with open(file_path, 'r') as f:
        file_content = f.read()

    with open(patch_path, 'r') as f:
        patch_content = f.read()

    sections = patch_content.split('<<<<<<< SEARCH')
    for section in sections[1:]:
        parts = section.split('=======')
        search_block = parts[0].strip('\n')
        replace_block = parts[1].split('>>>>>>> REPLACE')[0].strip('\n')

        if search_block in file_content:
            file_content = file_content.replace(search_block, replace_block)
        else:
            print(f"Error: Search block not found:\n{search_block}")
            return False

    with open(file_path, 'w') as f:
        f.write(file_content)
    return True

if __name__ == "__main__":
    if apply_merge_diff(sys.argv[1], sys.argv[2]):
        print("Patch applied successfully")
    else:
        sys.exit(1)
