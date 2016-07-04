relative_assets = false

# Root
# project_type = :stand_alone
# http_path = "/"
# project_path = "/"

# CSS and Sass
css_dir = "dist/styles/"
sass_dir = "app/styles/"

# Images
http_images_path = "../images" # Default: http_path + "/" + images_dir
# images_dir = "app/images"
images_path = "app/images" # Default: <project_path>/<images_dir>
# generated_images_dir = images_dir

# Fonts
fonts_dir = "dist/fonts/"

# JavaScript
javascripts_dir = "./dist/scripts/"

# Sprites
# sprite_load_path = "./resources/sprite/"

# output_style = :expanded or :nested or :compact or :compressed
output_style = :compressed

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass

Sass::Script::Number.precision = 10
