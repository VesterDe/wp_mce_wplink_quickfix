<?php
/*
Plugin Name: MCE_reseter
Plugin URI: http://wordpress.org/plugins/hello-dolly/
Description: This is not just a plugin, it symbolizes the hope and enthusiasm of an entire generation summed up in two words sung most famously by Louis Armstrong: Hello, Dolly. When activated you will randomly see a lyric from <cite>Hello, Dolly</cite> in the upper right of your admin screen on every page.
Author: Demjan Vester
Version: 0.1
*/
add_filter( 'mce_buttons', 'myplugin_register_buttons' );

function myplugin_register_buttons( $buttons ) {
   write_log($buttons);
   array_push( $buttons, 'separator', 'wplinkc' );
   return $buttons;
}

// Load the TinyMCE plugin : editor_plugin.js (wp2.5)
add_filter( 'mce_external_plugins', 'myplugin_register_tinymce_javascript' );

function myplugin_register_tinymce_javascript( $plugin_array ) {
   write_log($plugin_array);
   $plugin_array['wplinkc'] = plugins_url( '/js/plugin.js',__FILE__ );
   return $plugin_array;
}
function disable_mce_wptextpattern( $opt ) {
   write_log($opt);
    if ( isset( $opt['plugins'] ) && $opt['plugins'] ) {
        $opt['plugins'] = explode( ',', $opt['plugins'] );
        $opt['plugins'] = array_diff( $opt['plugins'] , array( 'wplink' ) );
        $opt['plugins'] = implode( ',', $opt['plugins'] );
    }

    return $opt;
}

add_filter( 'tiny_mce_before_init', 'disable_mce_wptextpattern' );


 ?>
