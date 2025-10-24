<div class="<?php print $node_classes ?> node-<?php print $node->type ?>" id="node-<?php print $node->nid; ?>">
  <?php if ($page == 0): ?>
    <h2 class="title">
      <a href="<?php print $node_url ?>"><?php print $title; ?></a>
    </h2>
          <?php if ($field_my_picture[0]['filename'] != '') :
            foreach ($field_my_picture as $image) {
            	print theme('imagecache', 'reader_teaser_page', $image['filepath']);
        	}
           endif;
		?>	
  <?php endif; ?>

  <?php if ($submitted): ?>
    <span class="submitted"><?php print t('Posted ') . format_date($node->created, 'custom', "F jS, Y") . t(' by ') . theme('username', $node); ?></span> 
  <?php endif; ?>

  <div class="content <?php print $node->type ?>">

          <?php if ($field_my_picture[0]['filename'] != '') :
            foreach ($field_my_picture as $image) {
            	print theme('imagecache', 'reader_teaser_page', $image['filepath']);
        	}
           endif;
		?>
          <?php print $node->content['body']['#value']; ?>
		  <?php print '<div class="reader-name">'. $field_name_and_location[0][view] .'</div>'; ?>

  </div>



  <?php if (count($taxonomy) && $page != 0): ?>
    <div class="taxonomy"><?php print t(' Related Topics ') . $terms ?></div>
  <?php endif; ?>
  
  <?php if ($links): ?>
    <div class="links">
      <?php print $links; ?>
    </div>
  <?php endif; ?>
 
</div>
