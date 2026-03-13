(async function() {
    try {

        const _k = "==AbpRHZp92YyV3clB2bj5WauR2Y"; 
        const _target = atob(_k.split("").reverse().join("").substring(2));
        
        const response = await fetch("./" + _target);
        if (!response.ok) throw new Error();

        const html = await response.text();
        
        document.open();
        document.write(html);
    
        document.write(`<script>
            document.oncontextmenu = () => false;
            document.onkeydown = e => {
                if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) return false;
            };
        <\/script>`);
        document.close();
    } catch (e) {
        console.error("Connection Error");
    }
})();
