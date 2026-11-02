#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int n, k;
        cin >> n >> k;
        int a[n];
        map<int, int> mp;
        for (int i = 0; i < n; i++) {
            cin >> a[i];
            mp[a[i]]++;
        }
        vector<int> v;
        for (auto p : mp)
            if (p.second >= k) v.push_back(p.first);
        if (v.empty()) {
            cout << -1 << endl;
            continue;
        }
        int best_l = v[0];
        int best_r = v[0];
        int max_len = 0;
        int start = 0;
        for (int i = 1; i < v.size(); i++) {
            if (v[i] == v[i - 1] + 1) {
                if (v[i] - v[start] > max_len) {
                    max_len = v[i] - v[start];
                    best_l = v[start];
                    best_r = v[i];
                }
            }
            else
                start = i;
        }
        cout << best_l << " " << best_r << endl;
    }
    return 0;
}
