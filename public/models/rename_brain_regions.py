import bpy
import sys

def parse_args():
    argv = sys.argv
    if "--" in argv:
        idx = argv.index("--")
        argv = argv[idx + 1:]
    else:
        argv = []
    if len(argv) < 2:
        print("Usage: blender --background --python rename_brain_regions.py -- input.glb output.glb")
        sys.exit(1)
    return argv[0], argv[1]

def clean_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)
    return list(bpy.context.selected_objects)

def main():
    input_path, output_path = parse_args()
    print(f"Renaming regions in: {input_path} -> {output_path}")
    clean_scene()
    objs = import_glb(input_path)

    # List of valid region keys
    region_keys = [
        "brain_base",
        "prompt",
        "dream",
        "trait_evolution",
        "trait_drift",
        "contradictions",
        "memory",
        "reflections"
    ]

    # Avoid duplicate names: first rename everything to temp, then strict
    for obj in bpy.data.objects:
        for key in region_keys:
            if key != "brain_base" and obj.name.startswith(key):
                obj.name = "TMP_" + key

    for obj in bpy.data.objects:
        for key in region_keys:
            if obj.name == "TMP_" + key:
                obj.name = key

    print("Region mesh names after renaming:")
    for obj in bpy.data.objects:
        print(" -", obj.name)

    # Export as GLB
    bpy.ops.export_scene.gltf(filepath=output_path, export_format='GLB')
    print("Done!")

if __name__ == "__main__":
    main()
