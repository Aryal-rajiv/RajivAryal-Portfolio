<?php
/**
 * Plugin Name: Headless Frontend Bridge (aryalrajiv.com.np)
 * Description: Tells the Next.js site to refresh when posts change, sends visitors and previews to the Next.js front end, and keeps the WordPress front end out of search results.
 * Version: 1.0.0
 * Author: Rajiv Aryal
 *
 * Install: copy this file to wp-content/mu-plugins/ (create the folder if needed).
 * Then add these two lines to wp-config.php, above "That's all, stop editing!":
 *
 *   define( 'HEADLESS_FRONTEND_URL', 'https://aryalrajiv.com.np' );
 *   define( 'HEADLESS_REVALIDATE_SECRET', 'same-value-as-REVALIDATE_SECRET-on-vercel' );
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function ra_frontend_url() {
	return defined( 'HEADLESS_FRONTEND_URL' ) ? untrailingslashit( HEADLESS_FRONTEND_URL ) : '';
}

/** Ping the Next.js revalidate endpoint. Non-blocking, so saving a post stays fast. */
function ra_revalidate( $slug = '' ) {
	if ( ! ra_frontend_url() || ! defined( 'HEADLESS_REVALIDATE_SECRET' ) ) {
		return;
	}
	wp_remote_post(
		ra_frontend_url() . '/api/revalidate',
		array(
			'blocking' => false,
			'timeout'  => 5,
			'headers'  => array(
				'Content-Type'        => 'application/json',
				'x-revalidate-secret' => HEADLESS_REVALIDATE_SECRET,
			),
			'body'     => wp_json_encode( array( 'slug' => $slug ) ),
		)
	);
}

add_action(
	'transition_post_status',
	function ( $new_status, $old_status, $post ) {
		if ( 'post' !== $post->post_type ) {
			return;
		}
		if ( 'publish' === $new_status || 'publish' === $old_status ) {
			ra_revalidate( $post->post_name );
		}
	},
	10,
	3
);

add_action(
	'post_updated',
	function ( $post_id, $after ) {
		if ( 'post' === $after->post_type && 'publish' === $after->post_status ) {
			ra_revalidate( $after->post_name );
		}
	},
	10,
	2
);

add_action( 'edited_category', function () { ra_revalidate(); } );
add_action( 'created_category', function () { ra_revalidate(); } );

/** "View post" links in wp-admin point at the Next.js site. */
add_filter(
	'post_link',
	function ( $url, $post ) {
		return ra_frontend_url() && 'publish' === $post->post_status ? ra_frontend_url() . '/research/' . $post->post_name : $url;
	},
	10,
	2
);

/** Send anyone visiting the WordPress front end to the real site (wp-admin, REST API and login keep working). */
add_action(
	'template_redirect',
	function () {
		if ( ! ra_frontend_url() || is_admin() || is_preview() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}
		if ( is_singular( 'post' ) ) {
			wp_redirect( ra_frontend_url() . '/research/' . get_post_field( 'post_name', get_queried_object_id() ), 301 );
			exit;
		}
		if ( is_category() ) {
			wp_redirect( ra_frontend_url() . '/research/category/' . get_queried_object()->slug, 301 );
			exit;
		}
		wp_redirect( ra_frontend_url() . '/research', 301 );
		exit;
	}
);

/** Keep the WordPress host itself out of search results to avoid duplicate content. */
add_filter( 'wp_robots', 'wp_robots_no_robots' );
add_filter( 'pre_option_blog_public', '__return_zero' );
