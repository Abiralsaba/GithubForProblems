#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        long long n, k;
        cin >> n >> k;
        string s = "";
        for (int i = 0; i < n; i++) s += 'a';
        long long pos = 1;
        while (k > pos) {
            k -= pos;
            pos++;
        }
        s[n - 1 - pos] = 'b';
        s[n - k] = 'b';
        cout << s << endl;
    }
    return 0;
}
