<?php
/*
Plugin Name: MCE_reseter
Plugin URI: https://github.com/VesterDe/wp_mce_wplink_quickfix/
Description: This plugin removes the inline link editing in tinyMCE. Also, it sends users to hell. You have been warned.
Author: Demjan Vester
Version: 0.0.1
*/
add_filter( 'mce_buttons', 'add_fixed_mce_plugin' );

function add_fixed_mce_plugin( $buttons ) {
   array_push( $buttons, 'separator', 'wplinkc' );
   return $buttons;
}

add_filter( 'mce_external_plugins', 'add_fixed_mce_js' );

function add_fixed_mce_js( $plugin_array ) {
   $plugin_array['wplinkc'] = plugins_url( '/js/plugin.js',__FILE__ );
   return $plugin_array;
}
function disable_mce_wptextpattern( $opt ) {
    if ( isset( $opt['plugins'] ) && $opt['plugins'] ) {
        $opt['plugins'] = explode( ',', $opt['plugins'] );
        $opt['plugins'] = array_diff( $opt['plugins'] , array( 'wplink' ) );
        $opt['plugins'] = implode( ',', $opt['plugins'] );
    }
    return $opt;
}

add_filter( 'tiny_mce_before_init', 'disable_mce_wptextpattern' );


 ?>
