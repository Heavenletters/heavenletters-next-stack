<div class="<?php print $node_classes ?> node-<?php print $node->type ?><?php if (!$status) { print ' node-unpublished'; } ?>" id="node-<?php print $node->nid; ?>">
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
print '<span class="submitted"><strong>Heavenletter #</strong>' . 	$node->field_heavenletter_[0][value];
print '&nbsp;<strong>Published on: </strong>' . $node->field_published_date[0][view] .'</span>';
if (!$status) : print '<br />This Heavenletter has not been published yet'; endif;
//if ($page != 0) : print '<div class="god-said">God said:</div>'; endif;
print '<div class="god-said">God said:</div>';
print $node->content['body']['#value'];
if ($page != 0 && $node->field_translated_by[0][view] != '') : print '<span class="autor">Translated by: '. $node->field_translated_by[0][view] .'</span>'; endif; 

if ($page != 0) print heaven_pager();
					 
?> 
</div>
<?php if ($page == 0 && !$is_front) : $clas = 'teaser'?>
<div class="read-more<?php print '-'. $clas ?> more-<?php print arg(0) ?>"><?php print l(t('Continue reading this Heavenletter ...'),"node/" . $node->nid) ?></div>
<?php endif; ?>
<?php if ($is_front) : ?>
<div class="read-more"><?php print l(t('Read more ...'),"node/" . $node->nid) ?></div>
<?php endif; ?>
<?php if ($page <> 0) : ?>
<div class="permalink"><span class="small_font"><br /><br />Permanent link to this Heavenletter:
<?php  
drupal_bootstrap(DRUPAL_BOOTSTRAP_PATH);
drupal_init_path();
$alias_url= drupal_lookup_path('alias', $_GET['q']);
$url=l('http://www.heavenletters.org/' . $alias_url, 'http://www.heavenletters.org/' . $alias_url); ?>
<?php print $url; ?> - Thank you for including this when publishing this Heavenletter elsewhere.</span></div>
<?php endif; ?>
<?php if (count($taxonomy) && $page != 0): ?>
<div class="taxonomy"><?php print t(' Related Topics ') . $terms ?></div>
<?php endif; ?>
<?php if ($links && !$is_front): ?>
<div class="links">
<?php print $links; ?>
<div class="addthis">
<a href="http://www.addthis.com/bookmark.php?v=250&pub=heaven" onmouseover="return addthis_open(this, '', '[URL]', '[TITLE]')" onmouseout="addthis_close()" onclick="return addthis_sendto()"><img src="http://s7.addthis.com/static/btn/lg-share-en.gif" width="125" height="16" alt="Bookmark and Share" style="border:0"/></a><script type="text/javascript" src="http://s7.addthis.com/js/250/addthis_widget.js?pub=heaven"></script>
</div>
</div>
<?php endif; ?>
</div>
