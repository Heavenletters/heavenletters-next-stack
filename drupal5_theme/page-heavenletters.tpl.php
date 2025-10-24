<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="<?php print $language ?>" xml:lang="<?php print $language ?>"><head><title><?php print $head_title; ?></title><?php print $head; ?><?php print $styles; ?></head><?php  ?><body class="sidebar-right centralized"><div id="page"><div id="header"><div class="lenguaje"><?php print $header; ?><?php print $search_box; ?></div><div id="logo-title"><?php if ($logo): ?><a href="<?php print $base_path; ?>" title="<?php print t('Home'); ?>"><img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>" id="logo" /> </a><?php endif; ?><div id="name-and-slogan"><?php if ($site_name): ?><h1 id='site-name'><a href="<?php print $base_path ?>" title="<?php print t('Home'); ?>"><?php print $site_name; ?></a></h1><?php endif; ?><?php if ($site_slogan): ?><div id='site-slogan'><?php print $site_slogan; ?></div><?php endif; ?></div></div><div id="navigation" class="menu <?php if ($primary_links) { print "withprimary"; } if ($secondary_links) { print " withsecondary"; } ?> "><?php if ($primary_links): ?><div id="primary" class="clear-block"><?php print theme('links', $primary_links, array('class' =>'links', 'id' => 'navlist')) ?></div><?php endif; ?></div><?php if ($header || $breadcrumb): ?><div id="header-region"><?php print $breadcrumb; ?></div><?php endif; ?></div><div id="container" class="clear-block heavenletters"><div id="main" class="column"><div id="squeeze"><?php if ($content_top):?><div id="content-top"><?php print $content_top; ?><div class="clear"></div></div><?php endif; ?><?php if ($tabs): ?><div class="tabs"><?php print $tabs; ?></div><?php endif; ?><?php if ($title): ?><h1 class="title"><?php print $title; ?></h1><?php endif; ?><?php print $help; ?><?php print $messages; ?><?php print $content; ?>
<p>&nbsp;</p>
<p>Your generosity keeps giving by keeping the lights on</p>
<form action="https://www.paypal.com/donate" method="post" target="_top">
<input type="hidden" name="hosted_button_id" value="AQQAS7386A5AU" />
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
<img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
</form>

<?php print $feed_icons; ?><?php if ($content_bottom): ?><div id="content-bottom"><?php print $content_bottom; ?></div><?php endif; ?></div></div><?php if ($sidebar_right): ?><div id="sidebar-right" class="column sidebar"><?php print $sidebar_right; ?><div class="top"><a href="#"><img src="https://heavenletters.org/sites/heavenletters.org/themes/h/images/top.png" title="Back to the top" border="0" /></a></div> </div><?php endif; ?><div class="clear"></div></div><div id="footer-wrapper"><div id="footer"><?php print $footer_message; ?></div></div><?php print $scripts; ?><?php print $closure; ?></div>
<script type="text/javascript">
  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();
</script>
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
