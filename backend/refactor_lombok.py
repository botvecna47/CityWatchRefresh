import os
import re

def strip_lombok_annotations(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove lombok imports
    content = re.sub(r'import lombok\..*?;\n', '', content)
    
    # Remove annotations
    for ann in ['@Data', '@Builder', '@NoArgsConstructor', '@AllArgsConstructor', '@Getter', '@Setter']:
        content = re.sub(r'^@' + ann[1:] + r'\b.*?\n', '', content, flags=re.MULTILINE)
        
    # Remove @Builder.Default
    content = re.sub(r'\s*@Builder\.Default\s*\n', '\n', content)
    
    return content

def generate_pojos(file_path):
    content = strip_lombok_annotations(file_path)
    
    # Extract class name
    class_match = re.search(r'public class (\w+)\s*\{', content)
    if not class_match: return
    class_name = class_match.group(1)
    
    # Search fields
    field_pattern = re.compile(r'private\s+([A-Za-z0-9_<>\[\]]+)\s+([a-zA-Z0-9_]+)\s*(?:=\s*[^;]+)?;')
    fields = field_pattern.findall(content)
    
    # Generate getters/setters/constructors
    methods = []
    
    # Empty constructor
    methods.append(f"    public {class_name}() {{}}\n")
    
    # All args constructor
    args = ", ".join([f"{t} {n}" for t, n in fields])
    assignments = "\n".join([f"        this.{n} = {n};" for t, n in fields])
    methods.append(f"    public {class_name}({args}) {{\n{assignments}\n    }}\n")
    
    # Getters and setters
    for t, n in fields:
        CapN = n[0].upper() + n[1:]
        methods.append(f"    public {t} get{CapN}() {{ return {n}; }}")
        methods.append(f"    public void set{CapN}({t} {n}) {{ this.{n} = {n}; }}")
    
    # Generate builder if not Request
    if "Request" not in class_name:
        builder_methods = []
        for t, n in fields:
            builder_methods.append(f"        public {class_name}Builder {n}({t} {n}) {{ this.{n} = {n}; return this; }}")
        
        builder_fields = "\n".join([f"        private {t} {n};" for t, n in fields])
        builder_assignments = "\n".join([f"            obj.{n} = this.{n};" for t, n in fields])
        
        builder_class = f"""
    public static {class_name}Builder builder() {{ return new {class_name}Builder(); }}
    public static class {class_name}Builder {{
{builder_fields}
{chr(10).join(builder_methods)}
        public {class_name} build() {{
            {class_name} obj = new {class_name}();
{builder_assignments}
            return obj;
        }}
    }}
"""
        methods.append(builder_class)
    
    # Append methods to class
    idx = content.rfind('}')
    if idx != -1:
        new_content = content[:idx] + "\n" + "\n".join(methods) + "\n}\n"
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Refactored {class_name}")

files = [
    r"c:\Users\Darshdeep\Desktop\Desktop\Trial And Error\CityWatchRevive_V_01\backend\src\main\java\com\citywatch\entity\Complaint.java",
    r"c:\Users\Darshdeep\Desktop\Desktop\Trial And Error\CityWatchRevive_V_01\backend\src\main\java\com\citywatch\dto\request\ComplaintRequest.java",
    r"c:\Users\Darshdeep\Desktop\Desktop\Trial And Error\CityWatchRevive_V_01\backend\src\main\java\com\citywatch\dto\response\ComplaintResponse.java"
]

for f in files: generate_pojos(f)
