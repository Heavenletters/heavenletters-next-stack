<script
  src="https://www.paypal.com/sdk/js?client-id=BAA73OfrdoCRHJPoxqfDITu_I1XlKG7zS4k_z6bBVrwfFWQanLfwffT3GQKVGJADQXkNWEgUuu5o9R5UTE&components=hosted-buttons&disable-funding=venmo&currency=USD">
</script>
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
$url=l('https://heavenletters.org/' . $alias_url, 'https://heavenletters.org/' . $alias_url); ?>
<?php print $url; ?> - Thank you for including this when publishing this Heavenletter elsewhere.</span></div>
<?php endif; ?>
<div id="paypal-container-M4MTQEDXBMMLS"></div>
<script>
  paypal.HostedButtons({
    hostedButtonId: "M4MTQEDXBMMLS",
  }).render("#paypal-container-M4MTQEDXBMMLS")
</script>


</div>

