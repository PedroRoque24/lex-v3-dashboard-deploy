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
        print("Usage: blender --background --python better_brain_split.py -- input.glb output.glb")
        sys.exit(1)
    return argv[0], argv[1]

def clean_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)
    meshes = [obj for obj in bpy.context.selected_objects if obj.type == "MESH"]
    if not meshes:
        print("ERROR: No mesh found in imported GLB!")
        sys.exit(1)
    return meshes[0]

def duplicate_mesh(mesh):
    bpy.ops.object.select_all(action='DESELECT')
    mesh.select_set(True)
    bpy.context.view_layer.objects.active = mesh
    bpy.ops.object.duplicate()
    dup_meshes = [obj for obj in bpy.context.selected_objects if obj.type == "MESH" and obj != mesh]
    if not dup_meshes:
        print("ERROR: Mesh duplication failed!")
        sys.exit(1)
    return dup_meshes[0]

def assign_vertex_group_faces(obj, groupname, center, radius):
    mesh = obj.data
    vg = obj.vertex_groups.new(name=groupname)
    count = 0
    for i, v in enumerate(mesh.vertices):
        dist = ((v.co.x - center[0])**2 + (v.co.y - center[1])**2 + (v.co.z - center[2])**2) ** 0.5
        if dist < radius:
            vg.add([i], 1.0, 'REPLACE')
            count += 1
    print(f"Assigned {count} vertices to region '{groupname}' (center={center}, radius={radius})")
    if count == 0:
        print(f"WARNING: No vertices assigned to region '{groupname}'. You may need to increase radius or adjust center.")
    return count

def separate_by_vertex_group(obj, groupname):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='DESELECT')
    bpy.ops.object.vertex_group_set_active(group=groupname)
    bpy.ops.object.vertex_group_select()
    bpy.ops.mesh.separate(type='SELECTED')
    bpy.ops.object.mode_set(mode='OBJECT')

def main():
    input_path, output_path = parse_args()
    print(f"Input: {input_path}  |  Output: {output_path}")
    clean_scene()
    mesh = import_glb(input_path)
    mesh.name = "brain_base"

    # Duplicate the mesh for splitting (so we keep full base!)
    mesh_split = duplicate_mesh(mesh)
    mesh_split.name = "brain_split"

    # Defensive: Check type
    if mesh_split.type != "MESH":
        print("ERROR: mesh_split is not a MESH after duplication!")
        sys.exit(1)

    # Find mesh bounds/center
    min_x, min_y, min_z = mesh_split.bound_box[0]
    max_x, max_y, max_z = mesh_split.bound_box[6]
    cx, cy, cz = (min_x + max_x) / 2, (min_y + max_y) / 2, (min_z + max_z) / 2
    dx, dy, dz = max_x - min_x, max_y - min_y, max_z - min_z

    print(f"Mesh bounds: X({min_x}, {max_x}) Y({min_y}, {max_y}) Z({min_z}, {max_z})")
    print(f"Mesh center: ({cx}, {cy}, {cz}), size: ({dx}, {dy}, {dz})")

    regions = [
        ("prompt",           (cx + 0.20*dx, cy, cz)),
        ("dream",            (cx - 0.20*dx, cy, cz)),
        ("trait_evolution",  (cx, cy + 0.18*dy, cz)),
        ("trait_drift",      (cx, cy - 0.20*dy, cz)),
        ("contradictions",   (cx, cy, cz + 0.22*dz)),
        ("memory",           (cx, cy, cz - 0.22*dz)),
        ("reflections",      (cx, cy, cz)),
    ]
    region_radius = 0.27 * max(dx, dy, dz)
    reflections_radius = 0.38 * max(dx, dy, dz)

    # Assign and separate regions on split mesh
    for name, center in regions:
        this_radius = reflections_radius if name == "reflections" else region_radius
        num = assign_vertex_group_faces(mesh_split, name, center, this_radius)
        if num == 0:
            print(f"ERROR: Region '{name}' has 0 assigned vertices. Try increasing 'region_radius' or adjusting region centers.")
        else:
            separate_by_vertex_group(mesh_split, name)

    # After separation, brain_base (full), and 7 region blobs will exist in scene

    # Optionally, hide brain_split (the now-empty mesh after separation)
    bpy.ops.object.select_all(action='DESELECT')
    if "brain_split" in bpy.data.objects:
        bpy.data.objects["brain_split"].select_set(True)
        bpy.ops.object.delete()

    # Export scene as GLB with new regions as objects
    bpy.ops.export_scene.gltf(filepath=output_path, export_format='GLB')
    print("Done! Exported: ", output_path)

if __name__ == "__main__":
    main()
