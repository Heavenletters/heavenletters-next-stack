<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="<?php print $language ?>" xml:lang="<?php print $language ?>"><head><title><?php print $head_title; ?></title><?php print $head; ?><?php print $styles; ?></head><body class="no-sidebar"><div id="page" class="no-sidebars"><div id="header"><div class="lenguaje"><?php print $header; ?><?php print $search_box; ?></div><div id="logo-title"><div id="name-and-slogan"><?php if ($site_name): ?><h1 id='site-name'><a href="<?php print $base_path ?>" title="<?php print t('Home'); ?>"><?php print $site_name; ?></a></h1><?php endif; ?><div id='site-slogan'><?php print $site_slogan; ?></div></div></div><div id="navigation" class="menu <?php if ($primary_links) { print "withprimary"; } if ($secondary_links) { print " withsecondary"; } ?> "><?php if ($primary_links): ?><div id="primary" class="clear-block"><?php print theme('links', $primary_links, array('class' =>'links', 'id' => 'navlist')) ?></div><?php endif; ?></div></div><div id="container" class="clear-block"><?php if ($content_top):?><div id="content-top"><?php print $content_top; ?></div><?php endif; ?><div id="main" class="column"><div id="squeeze"><?php print $messages; ?><div id="mission"><?php print $mission ?><div class="boxer m3"><div class="boxer-body"><span class="god"><?php print view_page_load(2, 2, "frontpage",'',''); ?></span></div><div class="boxer-bottom"></div></div></div></div><div id="outer_front"><div id="front_views"><h1>Today's Heavenletter</h1><?php print view_page_load(4, 1, '','teaser','embed'); ?><h1>A Beautiful Story</h1><?php print $content; ?><div class="clear"></div></div></div></div></div><div class="clear"></div></div><div id="footer-wrapper"><div id="footer"><?php print $footer_message; ?></div></div><?php print $scripts; ?><?php print $closure; ?></div>
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-1694227-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
</body></html>
