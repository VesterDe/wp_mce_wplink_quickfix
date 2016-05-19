( function( tinymce ) {
	tinymce.PluginManager.add( 'wplinkc', function( editor ) {
		var toolbar;
		var editToolbar;
		var previewInstance;
		var inputInstance;
		var linkNode;
		var doingUndoRedo;
		var doingUndoRedoTimer;
		var $ = window.jQuery;

		function getSelectedLink() {
			var href, html,
				node = editor.selection.getNode(),
				link = editor.dom.getParent( node, 'a[href]' );

			if ( ! link ) {
				html = editor.selection.getContent({ format: 'raw' });

				if ( html && html.indexOf( '</a>' ) !== -1 ) {
					href = html.match( /href="([^">]+)"/ );

					if ( href && href[1] ) {
						link = editor.$( 'a[href="' + href[1] + '"]', node )[0];
					}

					if ( link ) {
						editor.selection.select( link );
					}
				}
			}

			return link;
		}

		function removePlaceholders() {
			editor.$( 'a' ).each( function( i, element ) {
				var $element = editor.$( element );

				if ( $element.attr( 'href' ) === '_wp_link_placeholder' ) {
					editor.dom.remove( element, true );
				} else if ( $element.attr( 'data-wplink-edit' ) ) {
					$element.attr( 'data-wplink-edit', null );
				}
			});
		}

		function removePlaceholderStrings( content, dataAttr ) {
			if ( dataAttr ) {
				content = content.replace( / data-wplink-edit="true"/g, '' );
			}

			return content.replace( /<a [^>]*?href="_wp_link_placeholder"[^>]*>([\s\S]+)<\/a>/g, '$1' );
		}



		editor.addCommand( 'WP_Link', function() {
				window.wpLink.open( editor.id );
				return;
		} );

		editor.addCommand( 'wp_link_apply', function() {

			var href, text;

			if ( linkNode ) {
				href = inputInstance.getURL();
				text = inputInstance.getLinkText();
				editor.focus();

				if ( ! href ) {
					editor.dom.remove( linkNode, true );
					return;
				}

				if ( ! /^(?:[a-z]+:|#|\?|\.|\/)/.test( href ) ) {
					href = 'http://' + href;
				}

				editor.dom.setAttribs( linkNode, { href: href, 'data-wplink-edit': null } );

				if ( ! tinymce.trim( linkNode.innerHTML ) ) {
					editor.$( linkNode ).text( text || href );
				}
			}

			inputInstance.reset();
			editor.nodeChanged();

			// Audible confirmation message when a link has been inserted in the Editor.
			if ( typeof window.wp !== 'undefined' && window.wp.a11y && typeof window.wpLinkL10n !== 'undefined' ) {
				window.wp.a11y.speak( window.wpLinkL10n.linkInserted );
			}
		} );
		// WP default shortcut
		editor.addShortcut( 'access+a', '', 'WP_Link' );
		// The "de-facto standard" shortcut, see #27305
		editor.addShortcut( 'meta+k', '', 'WP_Link' );

		editor.addButton( 'link', {
			icon: 'link',
			tooltip: 'Insert/edit link',
			cmd: 'WP_Link',
			stateSelector: 'a[href]'
		});

		editor.addButton( 'unlink', {
			icon: 'unlink',
			tooltip: 'Remove link',
			cmd: 'unlink'
		});

		editor.addMenuItem( 'link', {
			icon: 'link',
			text: 'Insert/edit link',
			cmd: 'WP_Link',
			stateSelector: 'a[href]',
			context: 'insert',
			prependToContext: true
		});

		editor.on( 'pastepreprocess', function( event ) {
			var pastedStr = event.content,
				regExp = /^(?:https?:)?\/\/\S+$/i;

			if ( ! editor.selection.isCollapsed() && ! regExp.test( editor.selection.getContent() ) ) {
				pastedStr = pastedStr.replace( /<[^>]+>/g, '' );
				pastedStr = tinymce.trim( pastedStr );

				if ( regExp.test( pastedStr ) ) {
					editor.execCommand( 'mceInsertLink', false, {
						href: editor.dom.decode( pastedStr )
					} );

					event.preventDefault();
				}
			}
		} );

		// Remove any remaining placeholders on saving.
		editor.on( 'savecontent', function( event ) {
			event.content = removePlaceholderStrings( event.content, true );
		});

		// Prevent adding undo levels on inserting link placeholder.
		editor.on( 'BeforeAddUndo', function( event ) {
			if ( event.lastLevel && event.lastLevel.content && event.level.content &&
				event.lastLevel.content === removePlaceholderStrings( event.level.content ) ) {

				event.preventDefault();
			}
		});

		// When doing undo and redo with keyboard shortcuts (Ctrl|Cmd+Z, Ctrl|Cmd+Shift+Z, Ctrl|Cmd+Y),
		// set a flag to not focus the inline dialog. The editor has to remain focused so the users can do consecutive undo/redo.
		editor.on( 'keydown', function( event ) {
			if ( event.altKey || ( tinymce.Env.mac && ( ! event.metaKey || event.ctrlKey ) ) ||
				( ! tinymce.Env.mac && ! event.ctrlKey ) ) {

				return;
			}

			if ( event.keyCode === 89 || event.keyCode === 90 ) { // Y or Z
				doingUndoRedo = true;

				window.clearTimeout( doingUndoRedoTimer );
				doingUndoRedoTimer = window.setTimeout( function() {
					doingUndoRedo = false;
				}, 500 );
			}
		} );


		editor.on( 'wptoolbar', function( event ) {
			var linkNode = editor.dom.getParent( event.element, 'a' ),
				$linkNode, href, edit;

			if ( tinymce.$( document.body ).hasClass( 'modal-open' ) ) {
				return;
			}

			if ( linkNode ) {
				$linkNode = editor.$( linkNode );
				href = $linkNode.attr( 'href' );
				edit = $linkNode.attr( 'data-wplink-edit' );

				if ( href === '_wp_link_placeholder' || edit ) {
					if ( edit && ! inputInstance.getURL() ) {
					}

					event.element = linkNode;
				} else if ( href && ! $linkNode.find( 'img' ).length ) {
					event.element = linkNode;
					event.toolbar = toolbar;
				}
			}
		} );

		return {
			close: function() {
				editor.execCommand( 'wp_link_cancel' );
			}
		};
	} );
} )( window.tinymce );
