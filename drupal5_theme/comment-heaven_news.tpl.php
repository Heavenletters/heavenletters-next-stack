<div class="heaven-news-comment">
<h2 class="c_h2"><?php print $comment->subject; ?></h2>
    <div class="content"><?php print $content; ?></div>
    <?php if(arg(0) == 'node' && arg(1) != 4008): ?><div class="links"><?php print $links; ?></div><?php endif; ?>	
</div>