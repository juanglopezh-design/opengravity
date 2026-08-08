<?php
// Fashion Zaragoza Theme Functions

function fashion_zaragoza_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'gallery', 'caption'));
}
add_action('after_setup_theme', 'fashion_zaragoza_setup');

function fashion_zaragoza_scripts() {
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap', array(), null);
    wp_enqueue_style('fashion-zaragoza-style', get_stylesheet_uri(), array(), '1.0.0');
    wp_enqueue_script('fashion-zaragoza-script', get_template_directory_uri() . '/assets/main.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'fashion_zaragoza_scripts');
