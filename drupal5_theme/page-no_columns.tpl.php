<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="<?php print $language ?>" xml:lang="<?php print $language ?>"><head><title><?php print $head_title; ?></title><?php print $head; ?><?php print $styles; ?></head><?php  ?><body class="no-sidebar"><div id="page" class="no-sidebars"><div id="header"><div class="lenguaje"><?php print $header; ?><?php print $search_box; ?></div><div id="logo-title"><?php if ($logo): ?><a href="<?php print $base_path; ?>" title="<?php print t('Home'); ?>"><img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>" id="logo" /> </a><?php endif; ?><div id="name-and-slogan"><?php if ($site_name): ?><h1 id='site-name'><a href="<?php print $base_path ?>" title="<?php print t('Home'); ?>"><?php print $site_name; ?></a></h1><?php endif; ?><?php if ($site_slogan): ?><div id='site-slogan'><?php print $site_slogan; ?></div><?php endif; ?></div></div><div id="navigation" class="menu <?php if ($primary_links) { print "withprimary"; } if ($secondary_links) { print " withsecondary"; } ?> "><?php if ($primary_links): ?><div id="primary" class="clear-block"><?php print theme('links', $primary_links, array('class' =>'links', 'id' => 'navlist')) ?></div><?php endif; ?></div><?php if ($header || $breadcrumb): ?><div id="header-region"><?php print $breadcrumb; ?></div><?php endif; ?></div><div id="container" class="clear-block"><div id="main"><div class="squeeze"><?php print $tabs; ?><?php print $content; ?></div></div></div><div id="footer-wrapper"><div id="footer"><?php print $footer_message; ?></div></div><?php print $scripts; ?><?php print $closure; ?></div>
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
