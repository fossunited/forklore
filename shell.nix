with import <nixpkgs> {};
pkgs.mkShell {

  nativeBuildInputs = [ pkgs.bashInteractive ];
  buildInputs = with pkgs; [
	prettier eslint esbuild pre-commit
	uv yarn html-tidy djlint
  ];

 }
