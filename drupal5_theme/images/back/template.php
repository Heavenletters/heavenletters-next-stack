<?php
function phptemplate_menu_item($mid, $children = '', $leaf = TRUE) {
  return _phptemplate_callback('menu_item', array(
        'leaf' => $leaf,
        'mid' => $mid,
        'children' => $children
    ));
}
function h_regions() {
  return array(
       'left' => t('left sidebar'),
       'right' => t('right sidebar'),
       'content_top' => t('content top'),
       'content_bottom' => t('content bottom'),
       'header' => t('header'),
       'footer' => t('footer')
  );
} 

function h_breadcrumb($breadcrumb) {
   if (!empty($breadcrumb)) {
     return '<div class="breadcrumb">You are here: '. implode(' :: ', $breadcrumb) .'</div>';
   }
 }

function h_id_safe($string) {
  if (is_numeric($string{0})) {
    // if the first character is numeric, add 'n' in front
    $string = 'n'. $string;
  }
  return strtolower(preg_replace('/[^a-zA-Z0-9-]+/', '-', $string));
}
function phptemplate_forum_icon($new_posts, $num_posts = 0, $comment_mode = 0, $sticky = 0) {

  if ($num_posts > variable_get('forum_hot_topic', 15)) {
    $icon = $new_posts ? 'hot-new' : 'hot';
  }
  else {
    $icon = $new_posts ? 'new' : 'default';
  }

  if ($comment_mode == COMMENT_NODE_READ_ONLY || $comment_mode == COMMENT_NODE_DISABLED) {
    $icon = 'closed';
  }

  if ($sticky == 1) {
    $icon = 'sticky';
  }

  $output = '<div class="iconos forum-'. $icon .'"></div>';

  if ($new_posts) {
    $output = "<a name=\"new\">$output</a>";
  }
  return $output;
}
function phptemplate_comment_wrapper($content) {
$var = 'expanded';
if ($_GET['com'] == 'open') :
$var = 'expanded';
endif;
if (arg(0) == node && is_numeric(arg(1))) :
   $nodo = node_load(arg(1));
$empty = '';
if ($content == '') {
$empty = '<a class= "empty-text" href="comment/reply/'. $nodo->nid .'#comment-form">'. t('Be the first to post a comment') .'</a>';
}
if ($nodo->type != 'forum' && $content != '') :
 $output = '<div id="comments"><form><fieldset class="collapsible '. $var .'"><legend>Read Comments</legend>'. $content .'</fieldset></form></div>';
endif;
if ($nodo->type == 'forum' || $content == '') :
 $output = '<div id="comments">'. $empty . $content .'</div>';
endif;
if (($nodo->type == 'heaven_news' || arg(1) == 4008) && $content != '') :
 $output = '<div id="comments">'. $content .'</div>';
endif;
return $output;
endif;
}

drupal_add_js('sites/all/themes/h/add_bookmark.js');
drupal_add_js('misc/collapse.js');


function phptemplate_filter_tips($tips, $long = FALSE, $extra = '') { 
  $output = ''; 

  $multiple = count($tips) > 1; 
  if ($multiple) { 
    $output = t('input formats') .':'; 
  } 

  if (count($tips)) { 
    if ($multiple) { 
      $output .= '<ul>'; 
    } 
    foreach ($tips as $name => $tiplist) { 
      if ($multiple) { 
        $output .= '<li>'; 
        $output .= '<strong>'. $name .'</strong>:<br />'; 
      } 

      $tips = ''; 
      foreach ($tiplist as $tip) { 
        $tips .= '<li'. ($long ? ' id="filter-'. str_replace("/", "-", $tip['id']) .'">' : '>') . $tip['tip'] . '</li>'; 
      } 

      if ($tips) { 
        if (arg(0) != 'filter') {
        $output .= '<fieldset class="collapsible collapsed"><legend>Formatting Options</legend><ul class=\"tips\">' . $tips . '</ul></fieldset>'; 
		}
	    if (arg(0) == 'filter') {
        $output .= '<div style="with:90%;" ><ul class="tips">' . $tips . '</ul></div>'; 
}			
      } 

      if ($multiple) { 
        $output .= '</li>'; 
      } 
    } 
    if ($multiple) { 
      $output .= '</ul>'; 
    } 
  } 

  return $output; 
}
function _phptemplate_variables($hook, $vars = array()) {
  switch ($hook) {
  	case 'node':
		$ajax = $_GET['page'];
		if($ajax == 'ajax') {
			 $vars['links'] = '';
		}	
	break;
     
    case 'comment':
      // we load the node object that the current comment is attached to
      $node = node_load($vars['comment']->nid);
   	if ($node->type == 'heaven_news') {
     $vars['template_file'] = 'comment-heaven_news';   
   	}
      // if the author of this comment is equal to the author of the node, we set a variable
      // then in our theme we can theme this comment differently to stand out
      $vars['author_comment'] = $vars['comment']->uid == $node->uid ? TRUE : FALSE;
      break;
	
	case 'page':
	$ajax = $_GET['page'];
	if($ajax == 'ajax') {
			 $vars['template_file'] = 'page_ajax';
	}
    if (module_exists('page_title')) {
      $vars['head_title'] = page_title_page_get_title();
    }
    if(module_exists('javascript_aggregator') && $vars['scripts']) {
      $vars['scripts'] = javascript_aggregator_cache($vars['scripts']);
    }
	if ((arg(0) == 'node' && arg(1) == 3895) || $vars['node']->type == 'heavenletters' ) {
	    $vars['template_file'] = 'page-heavenletters';
 	}
	if ($vars['node']->type == 'forum') {
	    $vars['template_file'] = 'page-forum';	  
	} 
	if ($vars['node']->type == 'heaven_sutras') {
	    $vars['template_file'] = 'page-heaven_sutras';	  
	} 	
	if ($vars['node']->type == 'simple_page') {
	    $vars['template_file'] = 'page-no_columns';
		}
   break;
  }
  
  return $vars;
}

function phptemplate_views_filterblock($form) {
  $view = $form['view']['#value'];

  // make the 'q' come first
  $output = drupal_render($form['q']);

  foreach ($view->exposed_filter as $count => $filter) {
    $newform["fieldset$count"] = array(
      '#type' => 'fieldset',
      '#title' => $filter['label'],
      '#collapsible' => FALSE,
      '#weight' => $count - 1000, // we'll never have this many filters
    );
    $newform["fieldset$count"]['#collapsed'] = FALSE;
  }

  foreach ($form as $field => $value) {
    if (preg_match('/(op|filter)([0-9]+)/', $field, $match)) {
      $curcount = $match[2];
      $newform["fieldset$curcount"][$field] = $value;

      if (!isset($newform["fieldset$curcount"]['#weight'])) {
        $newform["fieldset$curcount"]['#weight'] = $value['#weight'];
      }
    }
    else {
      if ($field == 'submit' || drupal_substr($field, 0, 1) == '#') {
        unset($curcount);
      }
      if (isset($curcount)) {
        $newform["fieldset$curcount"][$field] = $value;
      }
      else {
        $newform[$field] = $value;
      }
    }
  }

  foreach ($view->exposed_filter as $count => $filter) {
    if ($filter['is_default']) {
      $newform["fieldset$count"]['#collapsed'] = FALSE;
      $open = TRUE;
    }
    else {
      $value = $newform["fieldset$count"]["filter$count"]['#default_value'];
      if (isset($value)) {
        if (is_array($value)) {
          foreach ($value as $key => $item) {
            if ($item != '') {
              $newform["fieldset$count"]['#collapsed'] = FALSE;
              $open = TRUE;
            }
          }
        }
        elseif ($value != '') {
          $newform["fieldset$count"]['#collapsed'] = FALSE;
          $open = TRUE;
        }
      }
    }
  }
  if (!$open) {
    $newform["fieldset0"]['#collapsed'] = FALSE;
  }

  return theme('views_filterblock_output', $newform);
}
function phptemplate_comment_block() {
  $items = array();
  foreach (comment_get_recent() as $comment) {
    $items[] = l($comment->subject, 'node/'. $comment->nid, NULL, "com=open", 'comment-'. $comment->cid) .'<br />'. t('@time ago', array('@time' => format_interval(time() - $comment->timestamp)));
  }
  if ($items) {
    return theme('item_list', $items);
  }
}

function permalink_link($type, $node = 0, $teaser = 0) {
  if (user_access('access permalink')) {
    if ($type == 'node') {
         $links = array();
         global $base_url;
         $url = $base_url . '/node/'.$node->nid;
         $links['permalink'] = array(
           'title' => t('Permalink'),
           'href' => $url,
           'attributes' => array('title' => t('A link to this content that should never change.'))
           );
    }
  }
  return $links;
}

