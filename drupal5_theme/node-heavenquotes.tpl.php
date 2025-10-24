<div class="<?php print $node_classes ?> node-<?php print $node->type ?>" id="node-<?php print $node->nid; ?>">
  <?php if ($page == 0): ?>
    <h2 class="title">
      <a href="<?php print $node_url ?>"><?php print $title; ?></a>
    </h2>
  <?php endif; ?>

  <?php if ($picture) print $picture; ?>  
  
  <?php if ($submitted): ?>
    <span class="submitted"><?php print t('Posted ') . format_date($node->created, 'custom', "F jS, Y") . t(' by ') . theme('username', $node); ?></span> 
  <?php endif; ?>

  <div class="content <?php print $node->type ?>">
				<?php 	
                     print $node->content['body']['#value']; 
					 print '<div class="related">Related Post:' . $node->field_heavenletter_title_associ[0][view] . '</div>';
                     print $node->jrating_html;
		 		?> 
  </div>
  <?php if ($node->type == 'heavenletters' && $page == 0) : ?>
		<div class="read-more"><?php print l(t('Continue reading this Heavenletter ...'),"node/" . $node->nid) ?></div>
  <?php endif; ?>

  <?php if (count($taxonomy) && $page != 0): ?>
    <div class="taxonomy"><?php print t(' Related Topics ') . $terms ?></div>
  <?php endif; ?>
  
  <?php if ($links && $page != 0): ?>
    <div class="links">
      <?php print $links; ?>
    </div>
  <?php endif; ?>
 
</div>